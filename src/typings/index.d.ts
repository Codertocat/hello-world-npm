export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithSnapshot(): R;
    }
  }
}