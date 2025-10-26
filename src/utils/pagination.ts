const paginationFunction = ({page = 1 , size = 10}:{page ?: number , size ?: number}) => {
    if(page < 1) page = 1;
    if(size < 1) size = 10;

    const limit = size;
    const skip = (page - 1) * size ;

    return { limit , skip};
}

export default paginationFunction;