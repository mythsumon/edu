import { useEffect, useRef } from 'react';

const useAutoFocus = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
};

export default useAutoFocus;