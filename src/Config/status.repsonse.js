



const OK_200 = (res, data, message) =>   {
     return res.status(200).json({
          message,
          data
     })
}
const NotFound_404 = (res, message) =>   {
     return res.status(404).json({
          message,
     })
}

const Found_422 = (res, message) =>   {
     return res.status(422).json({
          message,
     })
}

const Unauthorized_401 = (res, message) =>   {
     return res.status(401).json({
          message,
     })
}

const Forbiden_403 = (res, message) =>   {
     return res.status(403).json({
          message,
     })
}

const Server_500 = (res, error, message) =>   {
     return res.status(403).json({
          message,
          error: error.message
     })
}

export {
     OK_200,
     Found_422,
     NotFound_404,
     Unauthorized_401,
     Forbiden_403,
     Server_500
}