import prisma from '../lib/prisma';

type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

const promoteUserRole = async (userId: string, role: Role): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

export default promoteUserRole;
