import { prisma } from "../../HR/Lib/prisma.js";
import { Request, Response } from "express";
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const id = req.devId;

    if (!id) {
      return res.status(401).json({
        Message: "Unauthorized",
      });
    }

    const data = await prisma.developer.findUnique({
      where: {
        id,
      },
      include: {
        interviews: {
          include: {
            hr: {
              select: {
                name: true,
                email: true,
                companyName: true,
                companyWebsite: true,
              },
            },
            task: {
              include: {
                taskLibrary: {
                  select: {
                    title: true,
                    description: true,
                    requirements: true,
                    techStack: true,
                    difficulty: true,
                    duration: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({
        Messsage: "Developer Not Founded",
      });
    }

    res.status(200).json({
      dev: data,
    });
  } catch (e: any) {
    res.status(500).json({
      Message: "Server Error",
      Error: e.message,
    });
  }
};
