import { useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,

  Checkbox,
  Anchor,
  Stack,
} from '@mantine/core';

import client from '../client';

// export interface AuthenticationFormValues {
//     email: string,
//     name: string,
//     password: string,
//     terms: boolean,
// }

export function AuthenticationForm(props: PaperProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const loginMutation = useMutation("login", login, {
    onSuccess: () => {
      toast.success('User logged in successfully!');
      navigate('/profile');
    },
    onError: () => {
      toast.error('User could not be created.');
    }
  });

  const registerMutation = useMutation(register, {
    onSuccess: () => {
      toast.success('User created successfully!')
    },
    onError: () => {
      toast.error('User could not be logged in!')
    }
  });

  const [type, toggle] = useToggle(['login', 'register']);

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  type FormValues = typeof form.values;

  const handleSubmit = (formValues: FormValues) => {
    if (type === 'login') {
      loginMutation.mutate(formValues);
      return;
    }
    if (formValues.terms) {
      registerMutation.mutate(formValues);
      return;
    }
    //Throw Error
  }

  async function login(credentials: FormValues) {
    try {
      const { email, password } = credentials;
      const response = await client.login(email, password);
      setMessage(response.data.message);
      const token = response.data.token;
      if (token) {
        document.cookie = `token=${token}`;
      }
    } catch (err: any) {
      setMessage(
        (err.response &&
          err.response.data &&
          err.response.data.message) ||
          err.message || 
          err.toString()
      );
      throw new Error("Login failed");
    }
  }

  async function register(credentials: FormValues) {
    try {
      const { name, email, password } = credentials;
      const response = await client.register(name, email, password);
      setMessage(response.data.message);
    } catch (err: any) {
      setMessage(
        (err.response &&
          err.response.data &&
          err.response.data.message) ||
          err.message ||
          err.toString()
      );
      throw new Error("Registration failed");
    }
  }

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" weight={500}>
        Welcome to matGraphAI, {type} with
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === 'register' && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@matGraph.AI"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
          />

          {type === 'register' && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )}
        </Stack>

        <Group position="apart" mt="xl">
          <Anchor
            component="button"
            type="button"
            color="dimmed"
            onClick={() => toggle()}
            size="xs"
          >
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}