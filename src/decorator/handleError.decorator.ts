import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { messages } from '../shared/constants/messages';

interface ErrorHandlerParams {
  status?: number;
  message?: string;
  suppress?: boolean;
}

export function HandleError(error?: ErrorHandlerParams) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;
    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await originalMethod.apply(this, args);
      } catch (e: unknown) {
        if (error?.suppress) return;
        if (e instanceof HttpException) {
          throw e;
        }
        if (error?.message) {
          throw new HttpException(error.message, error.status ?? 500);
        }
        if (e instanceof Error && (e as AxiosError).isAxiosError) {
          const axiosError = e as AxiosError<any>;
          throw new HttpException(
            axiosError.response?.data?.message ??
              messages.INTERNAL_SERVER_ERROR,
            axiosError.response?.status ?? 500,
          );
        } else {
          console.error(e);
          throw new InternalServerErrorException(
            messages.INTERNAL_SERVER_ERROR,
            e instanceof Error ? e.stack : undefined,
          );
        }
      }
    };
  };
}

export function SyncHandleError(params?: {
  status?: number;
  message?: string;
  suppress?: boolean;
}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return originalMethod.apply(this, args);
      } catch (e) {
        handleError(e, params);
      }
    };
  };
}

function handleError(e: unknown, params?: ErrorHandlerParams): never {
  if (params?.suppress) return undefined as never;
  if (e instanceof HttpException) {
    throw e;
  }
  if (params?.message) {
    throw new HttpException(params.message, params.status ?? 500);
  }
  if (e instanceof Error && (e as AxiosError).isAxiosError) {
    const axiosError = e as AxiosError<any>;
    throw new HttpException(
      axiosError.response?.data?.message ?? messages.INTERNAL_SERVER_ERROR,
      axiosError.response?.status ?? 500,
    );
  } else {
    console.error(e);
    throw new InternalServerErrorException(
      messages.INTERNAL_SERVER_ERROR,
      e instanceof Error ? e.stack : undefined,
    );
  }
}
