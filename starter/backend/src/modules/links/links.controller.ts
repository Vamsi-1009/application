import { Request, Response } from "express";
import * as linksService from "./links.service";

export async function createLinkHandler(req: Request, res: Response) {
  const link = await linksService.createLink(req.userId!, req.body.targetUrl);
  res.status(201).json(link);
}

export async function listLinksHandler(req: Request, res: Response) {
  const links = await linksService.listLinks(req.userId!, req.query.cursor as string | undefined);
  res.json({ links });
}

export async function deleteLinkHandler(req: Request, res: Response) {
  await linksService.deleteLink(req.userId!, req.params.id);
  res.status(204).end();
}

export async function redirectHandler(req: Request, res: Response) {
  const targetUrl = await linksService.resolveAndCount(req.params.code);
  res.redirect(302, targetUrl);
}
