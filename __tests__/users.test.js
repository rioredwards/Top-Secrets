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
    email: 'test@example.com',
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

  it('POST /api/v1/sessions signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    expect(res.status).toEqual(200);
  });

  it('GET api/v1/users/protected should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/protected');
    expect(res.status).toEqual(401);
  });

  it('api/v1/users/protected should return the current user if authenticated', async () => {
    const agent = request.agent(app);
    // create user
    await UserService.create({ ...mockUser });
    // sign in user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    const res = await agent.get('/api/v1/users/protected');
    expect(res.status).toEqual(200);
  });

  afterAll(() => {
    pool.end();
  });
});