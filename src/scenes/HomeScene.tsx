import { useGreeting } from "@/hooks/useGreeting";

export function HomeScene() {
  const greeting = useGreeting("Tech Studio");
  return <p>{greeting}</p>;
}
