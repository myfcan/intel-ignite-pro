import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Monitor, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PostProcessingDemo } from '@/components/admin/demos/PostProcessingDemo';
import { InstancedMeshDemo } from '@/components/admin/demos/InstancedMeshDemo';
import { GLTFModelDemo } from '@/components/admin/demos/GLTFModelDemo';

export default function Admin3DDemos() {
  const navigate = useNavigate();
  const [instanceMode, setInstanceMode] = useState<'particles' | 'crowd'>('particles');
  const [modelMode, setModelMode] = useState<'devices' | 'crowd'>('devices');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Demonstrações 3D Avançadas
            </h1>
            <p className="text-slate-400">
              Post-Processing, InstancedMesh e Modelos 3D
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
          <CardContent className="flex items-start gap-4 p-4">
            <Info className="w-6 h-6 text-purple-400 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                <strong>Tecnologias instaladas:</strong> @react-three/postprocessing, @react-three/fiber, @react-three/drei
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-pink-500/50 text-pink-400">Bloom</Badge>
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">DepthOfField</Badge>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">InstancedMesh</Badge>
                <Badge variant="outline" className="border-green-500/50 text-green-400">GLTF Models</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demos */}
        <Tabs defaultValue="postprocessing" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="postprocessing" className="data-[state=active]:bg-pink-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Post-Processing
            </TabsTrigger>
            <TabsTrigger value="instanced" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              InstancedMesh
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-cyan-600">
              <Monitor className="w-4 h-4 mr-2" />
              Modelos 3D
            </TabsTrigger>
          </TabsList>

          {/* Post-Processing Tab */}
          <TabsContent value="postprocessing" className="space-y-4">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Post-Processing Effects
                </CardTitle>
                <CardDescription>
                  Bloom, Depth of Field, Vignette e Chromatic Aberration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PostProcessingDemo />
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-pink-400 mb-2">Efeitos Ativos:</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>✨ <strong>Bloom:</strong> Brilho intenso em áreas luminosas</li>
                      <li>📷 <strong>Depth of Field:</strong> Desfoque de profundidade</li>
                      <li>🎭 <strong>Vignette:</strong> Escurecimento nas bordas</li>
                      <li>🌈 <strong>Chromatic Aberration:</strong> Separação de cores</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-2">Como usar:</h4>
                    <pre className="text-xs text-slate-400 overflow-x-auto">
{`import { EffectComposer, Bloom } 
  from '@react-three/postprocessing'

<EffectComposer>
  <Bloom intensity={1.5} />
</EffectComposer>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* InstancedMesh Tab */}
          <TabsContent value="instanced" className="space-y-4">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      InstancedMesh - Renderização em Massa
                    </CardTitle>
                    <CardDescription>
                      Renderize milhares de objetos com a performance de um
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={instanceMode === 'particles' ? 'default' : 'outline'}
                      onClick={() => setInstanceMode('particles')}
                    >
                      Partículas (2000)
                    </Button>
                    <Button 
                      size="sm" 
                      variant={instanceMode === 'crowd' ? 'default' : 'outline'}
                      onClick={() => setInstanceMode('crowd')}
                    >
                      Multidão (500)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <InstancedMeshDemo mode={instanceMode} />
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Performance:</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>🚀 <strong>2000 partículas</strong> = 1 draw call</li>
                      <li>⚡ <strong>GPU Instancing</strong> para máxima performance</li>
                      <li>🎮 <strong>60 FPS</strong> mesmo com milhares de objetos</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-2">Como usar:</h4>
                    <pre className="text-xs text-slate-400 overflow-x-auto">
{`import { Instances, Instance } 
  from '@react-three/drei'

<Instances limit={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {items.map((item, i) => (
    <Instance key={i} position={item.pos} />
  ))}
</Instances>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-cyan-500" />
                      Modelos 3D e Animações
                    </CardTitle>
                    <CardDescription>
                      Monitores, smartphones e personagens 3D
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={modelMode === 'devices' ? 'default' : 'outline'}
                      onClick={() => setModelMode('devices')}
                    >
                      Dispositivos
                    </Button>
                    <Button 
                      size="sm" 
                      variant={modelMode === 'crowd' ? 'default' : 'outline'}
                      onClick={() => setModelMode('crowd')}
                    >
                      Multidão com Celulares
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <GLTFModelDemo mode={modelMode} />
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-2">Modelos Criados:</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>🖥️ <strong>Monitor:</strong> Tela com conteúdo emissivo</li>
                      <li>📱 <strong>Smartphone:</strong> Celular com tela brilhante</li>
                      <li>👤 <strong>Pessoa:</strong> Personagem segurando celular</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Para modelos reais:</h4>
                    <pre className="text-xs text-slate-400 overflow-x-auto">
{`import { useGLTF, useAnimations } 
  from '@react-three/drei'

function Model() {
  const { scene, animations } = useGLTF('/model.glb')
  const { actions } = useAnimations(animations, scene)
  
  useEffect(() => {
    actions['walk']?.play()
  }, [actions])
  
  return <primitive object={scene} />
}`}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Próximo Passo: Modelos Mixamo
                  </h4>
                  <p className="text-sm text-slate-300">
                    Para personagens animados realistas, baixe modelos do{' '}
                    <a 
                      href="https://www.mixamo.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      Mixamo (Adobe)
                    </a>
                    {' '}em formato GLB e use com useGLTF + useAnimations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
