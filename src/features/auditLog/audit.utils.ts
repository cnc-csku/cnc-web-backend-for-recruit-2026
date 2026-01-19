export class AuditUtils {
  private static isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => this.isEqual(val, b[idx]));
    }

    if (typeof a === "object" && typeof b === "object") {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => this.isEqual(a[key], b[key]));
    }

    return false;
  }

  public static calculateDiff(
    before: any,
    after: Partial<any>
  ): { before: Record<string, any>; after: Record<string, any> } {
    const diff = {
      before: {} as Record<string, any>,
      after: {} as Record<string, any>,
    };

    for (const key in after) {
      const beforeValue = before?.[key];
      const afterValue = after[key];

      if (!this.isEqual(beforeValue, afterValue)) {
        diff.before[key] = beforeValue;
        diff.after[key] = afterValue;
      }
    }

    return diff;
  }
}
