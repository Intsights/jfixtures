# jest-fixtures

This module allows you to inject dependencies to methods, by argument name.

Simple example:
``` typescript
import as jestFixtures from 'jfixtures'

class Fixtures {
    @jestFixtures.fixture
    dateMock(): Date {
        return new Date();
    }
}

jestFixtures.test('When called => return ok', async (dateMock: Date) => {
    console.log(dateMock, 'is available!');
});
```

Fixtures could use other fixtures!
``` typescript
import as jestFixtures from 'jfixtures'

import * as mongodb from 'mongodb';

import * as exampleDAO from '../example';

class Fixtures {
   @jestFixtures.fixture
    mongoClient(): mongodb.MongoClient {
        return new mongodb.MongoClient('no-such-mongo-server');
    }

    @jestFixtures.fixture
    exampleDB(mongoClient: mongodb.MongoClient): mongodb.Db {
        return mongoClient.db();
    }

    @jestFixtures.fixture
    exampleCollection(mongoClient: mongodb.MongoClient): mongodb.Collection {
        const collection = mongoClient.db().collection('');

        collection.find = jest.fn();
        collection.findOne = jest.fn();
        collection.deleteOne = jest.fn();

        return collection;
    }

    @jestFixtures.fixture
    exampleDao(mongoClient: mongodb.MongoClient): exampleDAO.ExampleDAO {
        return new exampleDAO.ExampleDAO(mongoClient);
    }
}

jestFixtures.test('When called => return ok', async (exampleDao: exampleDAO.ExampleDAO) => {
    console.log(exampleDao, 'is available!');
});
```