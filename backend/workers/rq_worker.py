from rq import Worker
from jobs.queue import image_queue


# Starts a worker that consumes background image jobs.
def main() -> None:
    worker = Worker([image_queue])

    # Enable scheduled retries, such as 30- and 120-second intervals.
    worker.work(with_scheduler=True)


if __name__ == "__main__":
    main()
