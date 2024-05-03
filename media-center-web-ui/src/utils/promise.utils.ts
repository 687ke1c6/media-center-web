export const resolveAfter = <T,>(obj: T, waitMs: number) =>
    new Promise<T>(res => setTimeout(() => res(obj), waitMs));