import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QualityIssue {
  type: 'volume_drop' | 'silence' | 'clipping' | 'distortion'
  timestamp: number
  severity: 'low' | 'medium' | 'high'
  description: string
}

interface QualityAnalysis {
  quality_score: number
  issues: QualityIssue[]
  recommendation: 'ok' | 'review' | 'regenerate'
  stats: {
    avg_volume: number
    max_volume: number
    min_volume: number
    silence_count: number
    total_duration: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audio_base64 } = await req.json()

    if (!audio_base64) {
      throw new Error('audio_base64 is required')
    }

    console.log('Analyzing audio quality...')

    // Decode base64 to bytes
    const audioBytes = Uint8Array.from(atob(audio_base64), c => c.charCodeAt(0))
    
    // Analyze audio properties
    const analysis = analyzeAudioBytes(audioBytes)

    console.log('Analysis complete:', analysis)

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error analyzing audio:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function analyzeAudioBytes(audioBytes: Uint8Array): QualityAnalysis {
  const issues: QualityIssue[] = []
  let qualityScore = 100
  
  // Estimate duration (rough approximation for MP3)
  const totalDuration = estimateMP3Duration(audioBytes)
  
  // Analyze volume levels (simplified analysis)
  const volumeStats = analyzeVolumeLevels(audioBytes)
  
  // Check for volume drops
  if (volumeStats.volumeDrops > 0) {
    issues.push({
      type: 'volume_drop',
      timestamp: volumeStats.firstDropTimestamp || 0,
      severity: volumeStats.maxDropPercentage > 50 ? 'high' : 'medium',
      description: `Volume caiu ${volumeStats.maxDropPercentage}% em ${volumeStats.firstDropTimestamp}s`
    })
    qualityScore -= volumeStats.maxDropPercentage > 50 ? 30 : 15
  }
  
  // Check for excessive silence
  if (volumeStats.silenceCount > 2) {
    issues.push({
      type: 'silence',
      timestamp: 0,
      severity: volumeStats.silenceCount > 5 ? 'high' : 'medium',
      description: `Detectados ${volumeStats.silenceCount} períodos de silêncio > 3s`
    })
    qualityScore -= volumeStats.silenceCount > 5 ? 20 : 10
  }
  
  // Check for clipping
  if (volumeStats.clippingCount > 0) {
    issues.push({
      type: 'clipping',
      timestamp: 0,
      severity: 'high',
      description: `Detectado clipping (distorção) em ${volumeStats.clippingCount} pontos`
    })
    qualityScore -= 25
  }
  
  // Determine recommendation
  let recommendation: 'ok' | 'review' | 'regenerate' = 'ok'
  if (qualityScore < 60) {
    recommendation = 'regenerate'
  } else if (qualityScore < 80) {
    recommendation = 'review'
  }
  
  return {
    quality_score: Math.max(0, qualityScore),
    issues,
    recommendation,
    stats: {
      avg_volume: volumeStats.avgVolume,
      max_volume: volumeStats.maxVolume,
      min_volume: volumeStats.minVolume,
      silence_count: volumeStats.silenceCount,
      total_duration: totalDuration
    }
  }
}

function estimateMP3Duration(bytes: Uint8Array): number {
  // Rough estimate: MP3 @ 128kbps ~ 16KB/s
  const sizeInKB = bytes.length / 1024
  const estimatedSeconds = sizeInKB / 16
  return Math.round(estimatedSeconds)
}

interface VolumeStats {
  avgVolume: number
  maxVolume: number
  minVolume: number
  volumeDrops: number
  maxDropPercentage: number
  firstDropTimestamp: number | null
  silenceCount: number
  clippingCount: number
}

function analyzeVolumeLevels(bytes: Uint8Array): VolumeStats {
  // This is a simplified analysis - in production you'd use proper audio analysis library
  // For now, we'll sample the byte values as a proxy for volume
  
  const sampleSize = 1000
  const step = Math.max(1, Math.floor(bytes.length / sampleSize))
  
  const samples: number[] = []
  for (let i = 0; i < bytes.length; i += step) {
    samples.push(bytes[i])
  }
  
  const avgVolume = samples.reduce((a, b) => a + b, 0) / samples.length
  const maxVolume = Math.max(...samples)
  const minVolume = Math.min(...samples)
  
  // Detect volume drops (simplified)
  let volumeDrops = 0
  let maxDropPercentage = 0
  let firstDropTimestamp: number | null = null
  let previousVolume = samples[0]
  
  for (let i = 1; i < samples.length; i++) {
    const currentVolume = samples[i]
    if (previousVolume > 0) {
      const dropPercentage = ((previousVolume - currentVolume) / previousVolume) * 100
      if (dropPercentage > 40) {
        volumeDrops++
        if (dropPercentage > maxDropPercentage) {
          maxDropPercentage = Math.round(dropPercentage)
          firstDropTimestamp = Math.round((i / samples.length) * estimateMP3Duration(bytes))
        }
      }
    }
    previousVolume = currentVolume
  }
  
  // Detect silence (very low volume over extended period)
  let silenceCount = 0
  let consecutiveLowSamples = 0
  const silenceThreshold = avgVolume * 0.2
  
  for (const sample of samples) {
    if (sample < silenceThreshold) {
      consecutiveLowSamples++
      if (consecutiveLowSamples > 30) { // ~3 seconds
        silenceCount++
        consecutiveLowSamples = 0
      }
    } else {
      consecutiveLowSamples = 0
    }
  }
  
  // Detect clipping (maximum values)
  const clippingCount = samples.filter(s => s > 250).length
  
  return {
    avgVolume: Math.round(avgVolume),
    maxVolume,
    minVolume,
    volumeDrops,
    maxDropPercentage,
    firstDropTimestamp,
    silenceCount,
    clippingCount: clippingCount > 10 ? Math.floor(clippingCount / 10) : 0
  }
}
