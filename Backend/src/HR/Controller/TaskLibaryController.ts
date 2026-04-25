import { Request, Response } from "express";
import { prisma } from "../Lib/prisma.js";
import { TaskLibary } from "../Lib/type.js";

export const getAllTask = async (req: Request, res: Response) => {
  try {
    const id = req.userId;



    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    const hr = await prisma.hR.findUnique({
      where: { id }
    })

    const isPro = (hr?.interviewCount ?? 0) < (hr?.interviewLimit ?? 5)

    const { category, isDefault } = req.query;

    const where: any = {
      OR: [{ isDefault: true }, { hrId: id }],
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (isDefault !== undefined) {
      where.isDefault = isDefault === "true";
    }

    const data = await prisma.taskLibrary.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      ...(isPro ? {} : { take: 10 }),
    })

    if (data.length === 0) {
      return res.status(200).json({
        data: [],
        status: "success",
      });
    }

    return res.status(200).json({
      data,
      count: data.length,
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const taskGetById = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    const taskId = req.params.id as string;

    const data = await prisma.taskLibrary.findUnique({
      where: { id: taskId },
    });

    if (!data) {
      return res.status(404).json({ Message: "Task not found" });
    }

    res.status(200).json({ data, status: "success" });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    const {
      title,
      description,
      requirements,
      category,
      techStack,
      difficulty,
      duration,
    }: TaskLibary = req.body;

    await prisma.taskLibrary.create({
      data: {
        hrId: id,
        title,
        description,
        requirements: requirements as any,
        category,
        techStack,
        difficulty,
        duration,
        isDefault: false,
      },
    });

    res.status(201).json({
      Message: "Task added to Task Library",
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    const taskId = req.params.id as string;

    const existing = await prisma.taskLibrary.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      return res.status(404).json({ Message: "Task not found" });
    }

    if (existing.isDefault) {
      return res.status(403).json({ Message: "Cannot edit default tasks" });
    }

    if (existing.hrId !== id) {
      return res.status(403).json({ Message: "Unauthorized" });
    }

    const {
      title,
      description,
      requirements,
      category,
      techStack,
      difficulty,
      duration,
    }: TaskLibary = req.body;

    await prisma.taskLibrary.update({
      where: { id: taskId },
      data: {
        title,
        description,
        requirements: requirements as any,
        category,
        techStack,
        difficulty,
        duration,
      },
    });

    res.status(200).json({
      Message: "Task Library updated",
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const DeleteTaskLibary = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    const taskId = req.params.id as string;

    const existing = await prisma.taskLibrary.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      return res.status(404).json({ Message: "Task not found" });
    }

    if (existing.isDefault) {
      return res.status(403).json({
        Message: "Default tasks cannot be deleted",
      });
    }

    if (existing.hrId !== id) {
      return res.status(403).json({ Message: "Unauthorized" });
    }

    await prisma.taskLibrary.delete({
      where: { id: taskId },
    });

    res.status(200).json({
      Message: "Task deleted successfully",
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const getTaskCategories = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    // Get unique categories for default tasks and tasks belonging to this HR
    const categories = await prisma.taskLibrary.findMany({
      where: {
        OR: [{ isDefault: true }, { hrId: id }],
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const uniqueCategories = categories.map((c) => c.category).filter(Boolean);

    res.status(200).json({
      data: uniqueCategories,
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};
