import { useState, useEffect, useRef } from 'react';

export const IFrameRenderer = ({ landingPageHtml, iframeRef }) => {
    return (
      <iframe
        ref={iframeRef}
        srcDoc={landingPageHtml}
        title="iframe-preview"
        width="100%"
        height="700px"
        sandbox
      ></iframe>
    );
}

export const IFramePreviewPage = () => {
  const iFrameRef = useRef(null);
  const [isIFrameLoaded, setIsIFrameLoaded] = useState(false);
  const iframeCurrent = iFrameRef.current;
  useEffect(() => {
    iframeCurrent?.addEventListener('load', () => setIsIFrameLoaded(true));
    return () => {
      iframeCurrent?.removeEventListener('load', () => setIsIFrameLoaded(true));
    };
  }, [iframeCurrent]);
  const landingPageHtml =
    '<p>This content is being injected into the iFrame.</p>';
  return (
    <div>
      <p>iFrame is loaded: {String(isIFrameLoaded)}</p>
      <IFrameRenderer landingPageHtml={landingPageHtml} />
      <IFrameRenderer landingPageHtml={landingPageHtml} iFrameRef={iFrameRef} />
    </div>
  );
};