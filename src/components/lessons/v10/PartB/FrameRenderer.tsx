import React from 'react';
import type { V10Frame, V10Element } from '../../../../types/v10.types';

import MockupChrome from './MockupChrome';
import WarningCard from './WarningCard';
import NavBreadcrumb from './NavBreadcrumb';
import DependencyReminder from './DependencyReminder';
import TooltipTerm from './TooltipTerm';
import CelebrationCard from '../shared/CelebrationCard';

import ChromeHeader from './elements/ChromeHeader';
import MockupInput from './elements/MockupInput';
import MockupSelect from './elements/MockupSelect';
import MockupButton from './elements/MockupButton';
import MockupImage from './elements/MockupImage';
import MockupTable from './elements/MockupTable';
import CodeBlock from './elements/CodeBlock';
import ShimmerPlaceholder from './elements/ShimmerPlaceholder';

interface FrameRendererProps {
  frame: V10Frame;
  accentColor: string;
}

function renderElement(element: V10Element, index: number, barColor?: string): React.ReactNode {
  switch (element.type) {
    case 'chrome_header':
      return <ChromeHeader key={index} url={element.url} />;

    case 'text':
      return (
        <p key={index} style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>
          {element.content}
        </p>
      );

    case 'input':
      return (
        <MockupInput
          key={index}
          label={element.label}
          value={element.value}
          placeholder={element.placeholder}
          highlight={element.highlight}
          barColor={barColor}
        />
      );

    case 'select':
      return (
        <MockupSelect
          key={index}
          label={element.label}
          options={element.options}
          selected={element.selected}
          highlight={element.highlight}
          barColor={barColor}
        />
      );

    case 'button':
      return (
        <MockupButton
          key={index}
          label={element.label}
          primary={element.primary}
          icon={element.icon}
          barColor={barColor}
        />
      );

    case 'button_primary':
      return (
        <MockupButton
          key={index}
          label={element.text || element.label || ''}
          primary={true}
          icon={element.icon}
          barColor={barColor}
        />
      );

    case 'warning':
      return <WarningCard key={index} text={element.text} />;

    case 'nav_breadcrumb':
      return (
        <NavBreadcrumb
          key={index}
          from={element.from}
          to={element.to}
          how={element.how}
        />
      );

    case 'dependency':
      return <DependencyReminder key={index} text={element.text} />;

    case 'celebration':
      return (
        <CelebrationCard
          key={index}
          text={element.text}
          next={element.next}
        />
      );

    case 'tooltip_term':
      return <TooltipTerm key={index} term={element.term} tip={element.tip || element.definition || ''} />;

    case 'image':
      return <MockupImage key={index} src={element.src} alt={element.alt} />;

    case 'table':
      return (
        <MockupTable key={index} headers={element.headers} rows={element.rows} />
      );

    case 'code_block':
      return (
        <CodeBlock
          key={index}
          language={element.language}
          content={element.content}
        />
      );

    case 'divider':
      return <hr key={index} className="border-t border-gray-200 my-1" />;

    case 'shimmer':
      return <ShimmerPlaceholder key={index} height={element.height} />;

    case 'grid_cards':
      return (
        <div key={index} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginTop: 4,
        }}>
          {(element.cards || []).map((card, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'flex-start',
              gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>{card.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
                {card.label}
              </span>
              <div style={{
                width: '100%',
                background: card.connected ? '#D1FAE5' : '#22C55E',
                color: card.connected ? '#059669' : '#fff',
                borderRadius: 6,
                padding: '4px 0',
                textAlign: 'center' as const,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                {card.connected ? '✓ Connected' : (element.button_label || 'Add')}
              </div>
            </div>
          ))}
        </div>
      );

    case 'checklist':
      return (
        <div key={index} style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 6,
        }}>
          {element.title && (
            <p style={{ fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 2 }}>
              {element.title}
            </p>
          )}
          {(element.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: item.checked ? 'none' : '1.5px solid #D1D5DB',
                  background: item.checked ? '#34D399' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.checked && <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>}
                </span>
                <span style={{ fontSize: 11, color: item.checked ? '#6B7280' : '#111827', lineHeight: 1.4 }}>
                  {item.text}
                </span>
              </div>
              {!item.checked && item.warning && (
                <p style={{ fontSize: 9, color: '#F59E0B', marginLeft: 24, lineHeight: 1.3 }}>
                  ⚠️ {item.warning}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case 'modal_overlay':
      return (
        <div key={index} style={{
          position: 'relative' as const,
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 10,
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: '16px 14px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
          }}>
            {element.icon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{element.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{element.title}</p>
              </div>
            )}
            {!element.icon && (
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{element.title}</p>
            )}
            {(element.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#34D399',
                  flexShrink: 0, marginTop: 4,
                }} />
                <span style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            {element.primary_button && (
              <div style={{
                background: '#22C55E',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 0',
                textAlign: 'center' as const,
                fontSize: 11,
                fontWeight: 700,
                marginTop: 4,
                animation: element.highlight_button ? 'pulse 1.5s infinite' : undefined,
              }}>
                {element.primary_button}
              </div>
            )}
            {element.cancel_button && (
              <p style={{ textAlign: 'center' as const, fontSize: 10, color: '#9CA3AF', cursor: 'pointer' }}>
                {element.cancel_button}
              </p>
            )}
          </div>
        </div>
      );

    default:
      console.warn(`[FrameRenderer] Unknown element type: ${(element as V10Element).type}`);
      return null;
  }
}

const FrameRenderer: React.FC<FrameRendererProps> = ({ frame, accentColor }) => {
  return (
    <MockupChrome
      barText={frame.bar_text}
      barSub={frame.bar_sub}
      barColor={frame.bar_color}
      tip={frame.tip}
      action={frame.action}
      check={frame.check}
      accentColor={accentColor}
    >
      {(frame.elements || []).map((element, index) => renderElement(element, index, frame.bar_color))}
    </MockupChrome>
  );
};

export default FrameRenderer;
