import { HttpContext } from "@adonisjs/core/build/standalone"
import RouteHist from "../Models/RouteHist"
import { DateTime } from "luxon"

export const CreateRouteHist = async (statusRoute, dateStart: number, message?: string) => {
  const { auth, request } = HttpContext.get()!

  try {
    await RouteHist.create({
      route: request.ctx?.route?.pattern ? request.ctx?.route?.pattern : " ",
      status: statusRoute ? statusRoute : "START",
      message: message ? message : " ",
      activity: request.ctx?.routeKey ? request.ctx?.routeKey : " ",
      body: request.body() ? request.body() : {},
      method: request.request.method ? request.request.method : " ",
      params: request.qs() ? request.qs() : {},
      userId: auth.user ? auth.user!.id : null,
      duration: dateStart ? DateTime.now().toMillis() - dateStart : 0
    })
  } catch (error) {
    console.log(error);
  }
}
