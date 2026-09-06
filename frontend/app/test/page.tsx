function Test() {
  return (
    <div className="container">
      {/* <article className="flex gap-4 bg-dark">
        <div>
          <img src="https://placehold.co/600x400" alt="" />
        </div>
        <section>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis
            praesentium fuga aliquam rem molestiae. Aspernatur minima commodi
            natus sed quidem consequatur modi illum, quisquam reprehenderit,
            fugit ut ducimus, sunt blanditiis!
          </p>
        </section>
      </article> */}

      <div className="max-w-sm rounded overflow-hidden shadow-lg dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-white/10 dark:hover:shadow-2xl">
        <img
          className="w-full"
          src="https://placehold.co/600x400"
          alt="Sunset in the mountains"
        />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
          <p className=" text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Voluptatibus quia, nulla! Maiores et perferendis eaque,
            exercitationem praesentium nihil.
          </p>
        </div>
        <div className="px-6 pt-4 pb-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            #photography
          </span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            #travel
          </span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            #winter
          </span>
        </div>
      </div>
    </div>
  );
}

export default Test;
