import React, { memo } from 'react';
import { BoundingRect, ViewportInfo } from '../types';

interface VisualOverlayProps {
  rect: BoundingRect | null;
  cardId: number | null;
  viewport: ViewportInfo;
}

export const VisualOverlay = memo<VisualOverlayProps>(({ rect, cardId, viewport }) => {
  if (!rect) return null;

  const { top, left, bottom, right, width, height } = rect;

  return (
    <div id="visualOverlay">
      {/* 边界框 */}
      <div
        className="boundary-box"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      />

      {/* Top 标签 */}
      <div
        className="dimension-label"
        style={{
          top: `${top - 30}px`,
          left: `${left}px`,
        }}
      >
        ↓ top: {Math.round(top)}px
      </div>

      {/* Left 标签 */}
      <div
        className="dimension-label"
        style={{
          top: `${top}px`,
          left: `${left - 100}px`,
        }}
      >
        → left: {Math.round(left)}px
      </div>

      {/* Bottom 标签 */}
      <div
        className="dimension-label"
        style={{
          top: `${bottom + 10}px`,
          left: `${left}px`,
        }}
      >
        ↑ bottom: {Math.round(bottom)}px
      </div>

      {/* Right 标签 */}
      <div
        className="dimension-label"
        style={{
          top: `${top}px`,
          left: `${right + 10}px`,
        }}
      >
        ← right: {Math.round(right)}px
      </div>

      {/* Width 箭头 */}
      <div
        className="arrow-line horizontal"
        style={{
          top: `${bottom + 30}px`,
          left: `${left}px`,
          width: `${width}px`,
        }}
      />
      <div
        className="dimension-label"
        style={{
          top: `${bottom + 40}px`,
          left: `${left + width / 2 - 50}px`,
          background: '#3b82f6',
        }}
      >
        width: {Math.round(width)}px
      </div>

      {/* Height 箭头 */}
      <div
        className="arrow-line vertical"
        style={{
          top: `${top}px`,
          left: `${right + 30}px`,
          height: `${height}px`,
        }}
      />
      <div
        className="dimension-label"
        style={{
          top: `${top + height / 2 - 15}px`,
          left: `${right + 40}px`,
          background: '#3b82f6',
        }}
      >
        height: {Math.round(height)}px
      </div>

      {/* 信息面板 */}
      <div
        className="info-panel"
        style={{
          top: `${Math.min(top, viewport.height - 250)}px`,
          left: `${Math.min(right + 100, viewport.width - 350)}px`,
        }}
      >
        <div>
          <span className="label">卡片 ID:</span>{' '}
          <span className="value">#{cardId}</span>
        </div>
        <div>
          <span className="label">top:</span>{' '}
          <span className="value">{Math.round(top)}px</span>
        </div>
        <div>
          <span className="label">left:</span>{' '}
          <span className="value">{Math.round(left)}px</span>
        </div>
        <div>
          <span className="label">bottom:</span>{' '}
          <span className="value">{Math.round(bottom)}px</span>
        </div>
        <div>
          <span className="label">right:</span>{' '}
          <span className="value">{Math.round(right)}px</span>
        </div>
        <div>
          <span className="label">width:</span>{' '}
          <span className="value">{Math.round(width)}px</span>
        </div>
        <div>
          <span className="label">height:</span>{' '}
          <span className="value">{Math.round(height)}px</span>
        </div>
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #444',
          }}
        >
          <span className="label">视口:</span>{' '}
          <span className="value">
            {viewport.width}×{viewport.height}px
          </span>
        </div>
      </div>
    </div>
  );
});