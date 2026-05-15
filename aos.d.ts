declare module "aos" {
  interface AosInstance {
    init(options?: Record<string, unknown>): void;
    refresh(): void;
    refreshHard(): void;
  }
  const AOS: AosInstance;
  export default AOS;
}
