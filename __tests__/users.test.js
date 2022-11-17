const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

describe('users', () => {
  beforeEach(() => {
    return setup(pool);
  });
  // Dummy user for testing
  const mockUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@defense.gov',
    password: '12345',
  };

  it('POST /api/v1/users creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    expect(res.status).toBe(200);
    const { firstName, lastName, email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('POST /api/v1/users/sessions signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@defense.gov', password: '12345' });
    expect(res.status).toEqual(200);
  });

  it('GET api/v1/users/protected should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/protected');
    expect(res.status).toEqual(401);
  });

  it('api/v1/users/protected should return "You are authenticated!" if authenticated', async () => {
    const agent = request.agent(app);
    // create user
    await UserService.create({ ...mockUser });
    // sign in user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@defense.gov', password: '12345' });
    const res = await agent.get('/api/v1/users/protected');
    expect(res.status).toEqual(200);
  });

  it('DELETE /sessions deletes the user session', async () => {
    const agent = request.agent(app);
    await UserService.create({ ...mockUser });

    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@defense.gov', password: '12345' });

    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
  });

  afterAll(() => {
    pool.end();
  });
});
