import { register } from '../app/children'
import { warn } from '../../utils/index'
import { isDev } from '../../utils/env'
import {
  pathMap,
  pathList,
  pathExists,
  nameExists,
  genParentPath,
} from './path'

/**
 * @description DFS 刷新路径 pathList 和 pathMap 并检查路由 path 和 name 是否重复
 * @typedef {import('../../index').Route} Route
 * @param {Array<Route>} routes
 * @param {String} [parentPath]
 *  1. from method calls: addRoutes(routes, parentPath)
 *  2. from route property: { path: '/bar', parentPath: '/foo', template: '<a href="/foo/bar">/foo/bar</a>' }
 */
export function refresh(routes, parentPath) {
  routes.forEach(
    ({ path, parentPath: selfParentPath, name, children, childrenApps }) => {
      /* 优先级 route.parentPath > addRouter(routes, parentPath) > VueMfe.defaultConfig.parentPath */
      if (selfParentPath) {
        path = genParentPath(path, selfParentPath, name)
      } else if (parentPath) {
        path = genParentPath(path, parentPath, name)
      }

      if (path) {
        if (!pathExists(path)) {
          pathList.push(path)
        } else {
          warn(`The path ${path} in pathList has been existed`)
        }
      }

      if (name) {
        if (!nameExists(name)) {
          pathMap[name] = path
        } else {
          warn(`The name ${name} in pathMap has been existed`)
        }
      }

      // if childrenApps exists records it with its fullPath
      register(childrenApps, path)

      if (children && children.length) {
        // @ts-ignore
        return refresh(children, path)
      }
    }
  )

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(pathList)
    // eslint-disable-next-line no-console
    console.log(pathMap)
  }
}
