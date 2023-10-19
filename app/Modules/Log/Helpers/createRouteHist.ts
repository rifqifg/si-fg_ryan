import RouteHist from "../Models/RouteHist"

export const CreateRouteHist = async (request, statusRoute, message?: string) => {
  await RouteHist.create({
    route: request.ctx?.route?.pattern ? request.ctx?.route?.pattern : " ",
    status: statusRoute ? statusRoute : "START",
    message: message ? message : " ",
    activity: request.ctx?.routeKey ? request.ctx?.routeKey : " ",
    body: request.body() ? request.body() : {},
    method: request.request.method ? request.request.method : " ",
    params: request.qs() ? request.qs() : {}
  })
}
