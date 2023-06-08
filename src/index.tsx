import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import toast from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      if (query.state.data !== undefined) {
        if (error instanceof Error) {
          toast.error(`Something went wrong: ${error.message}`);
        }
      }
    },
  }),
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
