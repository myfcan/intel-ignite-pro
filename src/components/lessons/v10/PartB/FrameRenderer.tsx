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
        <p key={index} className="text-sm text-gray-800 leading-relaxed">
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
      return <TooltipTerm key={index} term={element.term} tip={element.tip} />;

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
      return <hr key={index} className="border-t border-gray-200 my-2" />;

    case 'shimmer':
      return <ShimmerPlaceholder key={index} height={element.height} />;

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
