# jest-fixtures

This module allows you to inject dependencies to methods, by argument name.

Example:
``` typescript
import as jestFixtures from 'jest-fixtures'

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