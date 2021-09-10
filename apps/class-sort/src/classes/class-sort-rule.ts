export class ClassSortRule {
  private flatten<T>(collection: (T | T[])[]): T[] {
    const out = [];
    collection.forEach((item) => {
      if (Array.isArray(item)) {
        out.push(...item);
        return;
      }
      out.push(item);
    });
    return out;
  }
}
