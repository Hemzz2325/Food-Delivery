const CategoryCard = ({ name, image }) => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-gradient-to-b from-white to-gray-50 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out cursor-pointer w-[110px] h-[140px]">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-sm font-semibold text-gray-800 text-center capitalize truncate">
        {name}
      </p>
      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default CategoryCard;
