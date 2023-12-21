export const RolesHelper = (userObject) => {
  const role_names: any = []

  userObject.roles.map(role => {
    role_names.push(role.role_name)
  })

  return role_names
}
