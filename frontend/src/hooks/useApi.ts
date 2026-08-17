import { useState } from "react";

type Service<TArgs, TResponse> = (
    args: TArgs
) => Promise<{ data: TResponse }>;

export function useApi() {
    const [data, setData] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRequest = async <TArgs, TResponse>(
        service: Service<TArgs, TResponse>,
        args: TArgs
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await service(args);

            setData(response.data);
            setIsSuccess(true);

            return {
                success: true,
                data: response.data,
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