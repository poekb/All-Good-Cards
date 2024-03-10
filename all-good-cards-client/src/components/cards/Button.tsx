"use client";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const loadingContext = createContext<
  [Set<string>, Dispatch<SetStateAction<Set<string>>>] | null
>(null);

function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(new Set<string>());
  return (
    <loadingContext.Provider value={[loading, setLoading]}>
      {children}
    </loadingContext.Provider>
  );
}

function UseClearLoading() {
  const [_, setLoading] = useContext(loadingContext) || [];
  const clearLoading = () => {
    setLoading && setLoading(new Set<string>());
  };
  return clearLoading;
}
function UseRemoveLoading() {
  const [loading, setLoading] = useContext(loadingContext) || [];
  const removeLoading = (id: string) => {
    const newSet = new Set<string>(loading);
    newSet.delete(id);
    setLoading && setLoading(newSet);
  };
  return removeLoading;
}

export default function Button({
  className,
  children,
  onClick,
  id,
}: {
  className: string;
  children: React.ReactNode;
  onClick: () => any;
  id: string;
}) {
  const [loading, setLoading] = useContext(loadingContext) || [];
  function click() {
    if (!loading?.has(id)) {
      setLoading && setLoading(new Set(loading).add(id));
      onClick();
    }
  }

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      //document.getElementById('login-form')?.style.setProperty('--rotation',rotation+'deg');

      setRotation(rotation + 5);
      if (rotation >= 360) {
        setRotation(rotation - 360);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [rotation]);

  return (
    <div
      lang="hu"
      onClick={click}
      className={
        (loading?.has(id) ? "rotating-edge scale-100" : "hover:scale-105") +
        " rounded-xl gigabold cursor-pointer relative select-none transition-all " +
        className
      }
      style={
        {
          "--rotation": rotation + "deg",
        } as React.CSSProperties
      }
    >
      <div
        className={"rounded-xl gigabold bg-inherit w-full h-full absolute"}
      ></div>
      <div className="" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export { LoadingProvider, UseClearLoading, UseRemoveLoading };
