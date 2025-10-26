import { Model, Document, Query } from 'mongoose'; // Importing necessary Mongoose types
import paginationFunction from './pagination.js';

// Define the type for the query data
interface QueryData {
  page?: number;
  size?: number;
  searchKey?: string;
  sort?: string;
  [key: string]: any; // Allow other properties for filters
}

// Define the type for pagination response
interface Pagination {
  limit: number;
  skip: number;
}

// The ApiFeatures class to handle filters, sorting, and pagination
export class ApiFeatures<T extends Document> {
  mongooseQuery: Query<T[], T>; // Mongoose query with generic document type
  queryData: QueryData; // Data used to customize the query

  constructor(mongooseQuery: Query<T[], T>, queryData: QueryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }

  // Pagination method
  pagination(): this {
    const { page, size } = this.queryData;
    const { limit, skip }: Pagination = paginationFunction({ page, size }); // Assuming paginationFunction is correctly typed
    this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }

  // Search method to filter by title or description
  search(): this {
    const { searchKey } = this.queryData;
    if (searchKey) {
      const search = {
        $or: [
          { name: { $regex: searchKey, $options: 'i' } },
          { CDM: { $regex: searchKey, $options: 'i' } }
        ],
      };
      this.mongooseQuery.find(search);
    }
    return this;
  }

  // Sorting method
  sort(): this {
    if (this.queryData.sort) {
      // Replace commas with spaces for Mongoose sort format
      this.mongooseQuery.sort(this.queryData.sort.replaceAll(',', ' '));
    }
    return this;
  }

  // Filtering method
  filters(): this {
    const queryInstance = { ...this.queryData };
    const excludedKeys = ['sort', 'select', 'searchKey', 'size', 'page'];
    excludedKeys.forEach((key) => delete queryInstance[key]);

    // Transform filter keys to Mongoose format (e.g., gt -> $gt)
    const filters = JSON.parse( 
      JSON.stringify(queryInstance).replace(
        /\b(gt|gte|lt|lte|eq|in|nin|neq|regex)\b/g,
        (match) => `$${match}`
      )
    );

    this.mongooseQuery.find(filters);
    return this;
  }

  // Method to select specific fields (if needed)
  select(): this {
    if (this.queryData.select) {
      this.mongooseQuery.select(this.queryData.select.replaceAll(',', ' '));
    }
    return this;
  }
}
