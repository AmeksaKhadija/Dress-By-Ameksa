// Mock for @gradio/client (ESM module that Jest can't parse)
module.exports = {
  Client: {
    connect: jest.fn().mockResolvedValue({
      predict: jest.fn().mockResolvedValue({ data: [{ url: 'https://example.com/result.png' }] }),
    }),
  },
  handle_file: jest.fn((path) => path),
};
