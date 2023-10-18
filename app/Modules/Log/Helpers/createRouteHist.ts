import RouteHist from "../Models/RouteHist"

export const CreateRouteHist = async (request, statusRoute, message?: string) => {
  await RouteHist.create({
    route: request.ctx?.route?.pattern,
    status: statusRoute,
    message: message ? message : " ",
    activity: request.ctx?.routeKey,
    body: request.body(),
    method: request.request.method,
    params: request.qs()
  })
}
