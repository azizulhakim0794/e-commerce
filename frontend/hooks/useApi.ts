import { useState } from "react";

type ServiceResult<TResponse> = TResponse | { data: TResponse };

type Service<TArgs, TResponse> = (
    args: TArgs
) => Promise<ServiceResult<TResponse>>;

export function useApi() {
    const [data, setData] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRequest = async <TArgs, TResponse>(
        service: Service<TArgs, TResponse> | Promise<ServiceResult<TResponse>>,
        args?: TArgs
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const response =
                service instanceof Promise
                    ? await service
                    : await service(args as TArgs);

            const responseData =
                response && typeof response === "object" && "data" in response
                    ? response.data
                    : response;

            setData(responseData);
            setIsSuccess(true);

            return {
                success: true,
                data: responseData,
            };
        } catch (error) {
            setError(error);
            setIsSuccess(false);

            return {
                success: false,
                data: null,
            };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleRequest,
        data,
        isLoading,
        error,
        isSuccess,
    };
}