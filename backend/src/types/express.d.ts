declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: string; organizationId?: string; branchId?: string };
    }
  }
}
export {};
