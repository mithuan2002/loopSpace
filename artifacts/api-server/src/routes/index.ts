import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import projectsRouter from "./projects";
import pagesRouter from "./pages";
import feedbackRouter from "./feedback";
import dashboardRouter from "./dashboard";
import analysisRouter from "./analysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(projectsRouter);
router.use(pagesRouter);
router.use(feedbackRouter);
router.use(dashboardRouter);
router.use(analysisRouter);

export default router;
