declare module 'react-signature-canvas' {
  import React from 'react';
  
  interface SignatureCanvasProps {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    backgroundColor?: string;
    penColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    onBegin?: (event: MouseEvent | TouchEvent) => void;
    onEnd?: (event: MouseEvent | TouchEvent) => void;
    dotSize?: number | (() => number);
  }

  class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    fromDataURL(dataURL: string, options?: any): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    toData(): any;
    fromData(pointGroups: any): void;
    off(): void;
    on(): void;
    isEmpty(): boolean;
    getCanvas(): HTMLCanvasElement;
  }

  export default SignatureCanvas;
}