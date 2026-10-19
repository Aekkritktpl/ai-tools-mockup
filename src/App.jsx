import { useEffect, useState } from 'react';
import Whiteboard from './Whiteboard.jsx';
import Tools from './Tools.jsx';

// Hash routing (#/ and #/tools) so GitHub Pages never needs server rewrites.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  return hash.startsWith('#/tools') ? <Tools /> : <Whiteboard />;
}
