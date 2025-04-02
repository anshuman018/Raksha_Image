import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Raksha/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders security badge', () => {
  render(<App />);
  const securityElement = screen.getByText(/BETA/i);
  expect(securityElement).toBeInTheDocument();
});

test('renders all tabs', () => {
  render(<App />);
  const encryptTab = screen.getByText(/Encrypt/i);
  const decryptTab = screen.getByText(/Decrypt/i);
  const securityTab = screen.getByText(/Security/i);
  
  expect(encryptTab).toBeInTheDocument();
  expect(decryptTab).toBeInTheDocument();
  expect(securityTab).toBeInTheDocument();
});
