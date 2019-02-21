# json-class-serializer
Serialize javascript classes to and from json.


```js
class User {
    constructor (id, status) {
        this.id = id
        this.status = status
    }
}

class UserCollection extends Array {
    getActive () {
        return this.filter(item => item.status === 'active')
    }
}
```

```js
const serializer = new Serializer([UserCollection, User])

const users = new UserCollection(
    new User(1, 'active'),
    new User(2, 'inactive'),
)

const serialized = serializer.stringify(users)

const newUsers = serializer.parse(serialized)

console.log(users, serialized, newUsers)
```
