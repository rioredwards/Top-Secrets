const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

describe('secrets', () => {
  beforeEach(() => {
    return setup(pool);
  });

  // Dummy user for testing
  const mockUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: '12345',
  };

  it('GET api/v1/secrets should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.status).toEqual(401);
  });

  it('api/v1/secrets should return the list of secrets if authenticated', async () => {
    const agent = request.agent(app);
    // create user
    await UserService.create({ ...mockUser });
    // sign in user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toEqual(200);
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "createdAt": "2022-11-17T00:39:07.400Z",
          "description": "secret description 1",
          "id": "1",
          "title": "Secret Title 1",
        },
        Object {
          "createdAt": "2022-11-17T00:39:07.400Z",
          "description": "secret description 2",
          "id": "2",
          "title": "Secret Title 2",
        },
        Object {
          "createdAt": "2022-11-17T00:39:07.400Z",
          "description": "secret description 3",
          "id": "3",
          "title": "Secret Title 3",
        },
      ]
    `);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  afterAll(() => {
    pool.end();
  });
});
