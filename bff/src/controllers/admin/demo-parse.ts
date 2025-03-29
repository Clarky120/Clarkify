import { Request, Response } from "express";

export const parseDemo = async (req: Request, res: Response) => {
  //   const { files } = req.body;
  //   console.log(files);
  res.status(200).json({ message: "Files uploaded successfully" });
};
