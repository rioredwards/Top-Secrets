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

  // Dummy secret for testing
  const mockSecret = {
    title: 'Secret Title',
    description: 'secret description',
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
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('POST api/v1/secrets should return a 401 if not authenticated', async () => {
    const res = await request(app).post('/api/v1/secrets').send(mockSecret);
    expect(res.status).toEqual(401);
  });

  it('POST /api/v1/secrets creates a new secret', async () => {
    const agent = request.agent(app);
    // create user
    await UserService.create({ ...mockUser });
    // sign in user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    const res = await agent.post('/api/v1/secrets').send(mockSecret);
    const { title, description } = mockSecret;

    expect(res.body).toEqual({
      id: expect.any(String),
      title,
      description,
      createdAt: expect.any(String),
    });
  });

  afterAll(() => {
    pool.end();
  });
});
