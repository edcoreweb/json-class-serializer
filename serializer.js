import { isFunction, isObjectLike, isArrayLike } from 'lodash-es'

const isObjectOrArrayLike = (value) => isObjectLike(value) || isArrayLike(value)

export default class Serializer {
  constructor (items = []) {
    this.registry = {}

    items.forEach(i => this.register(i))
  }

  call (prop, target, def) {
    if (isObjectOrArrayLike(target) && isFunction(target[prop])) {
      return target[prop]()
    }

    return def
  }

  isRegistered (value) {
    if (!isObjectOrArrayLike(value) || !value.constructor) {
      return false
    }

    const name = value.constructor.name
    return name in this.registry && value instanceof this.registry[name]
  }

  stringify (data) {
    return JSON.stringify(data, (key, value) => {
      if (!this.isRegistered(value)) {
        return value
      }

      value = this.call('toJSON', value, value)

      return {
        ...value,
        __sid_array__: value instanceof Array,
        __sid__: value.constructor.name
      }
    })
  }

  parse (data) {
    return JSON.parse(data, (key, value) => {
      value = this.call('fromJSON', value, value)

      if (isObjectLike(value) && value.__sid__ && this.registry[value.__sid__]) {
        const sid = value.__sid__
        const sidArray = value.__sid_array__

        delete value['__sid__']
        delete value['__sid_array__']

        if (sidArray) {
          return this.registry[sid].prototype.constructor.from(Object.values(value))
        }

        const obj = Object.create(this.registry[sid].prototype)
        return Object.assign(obj, value)
      }

      return value
    })
  }

  register (type, name = null) {
    name = name || type.name

    this.registry[name] = type
  }
}
