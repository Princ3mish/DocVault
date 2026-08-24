import { GraphQLResolveInfo } from 'graphql';
import { Collection as PrismaCollection, Document as PrismaDocument } from '@prisma/client';
import { GraphQLContext } from '../lib/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Collection = {
  __typename?: 'Collection';
  createdAt: Scalars['String']['output'];
  documents: Array<Document>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Document = {
  __typename?: 'Document';
  collection: Collection;
  collectionId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type DocumentConnection = {
  __typename?: 'DocumentConnection';
  edges: Array<Document>;
  pageInfo: PageInfo;
};

export type Mutation = {
  __typename?: 'Mutation';
  createCollection: Collection;
  createDocument: Document;
  deleteDocument: Scalars['Boolean']['output'];
  moveDocument: Document;
  updateDocument: Document;
};


export type MutationCreateCollectionArgs = {
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationCreateDocumentArgs = {
  collectionId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};


export type MutationDeleteDocumentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveDocumentArgs = {
  collectionId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
};


export type MutationUpdateDocumentArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['ID']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  collection?: Maybe<Collection>;
  collections: Array<Collection>;
  documents: DocumentConnection;
};


export type QueryCollectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDocumentsArgs = {
  collectionId?: InputMaybe<Scalars['ID']['input']>;
  cursor?: InputMaybe<Scalars['ID']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Collection: ResolverTypeWrapper<PrismaCollection>;
  Document: ResolverTypeWrapper<PrismaDocument>;
  DocumentConnection: ResolverTypeWrapper<Omit<DocumentConnection, 'edges'> & { edges: Array<ResolversTypes['Document']> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Collection: PrismaCollection;
  Document: PrismaDocument;
  DocumentConnection: Omit<DocumentConnection, 'edges'> & { edges: Array<ResolversParentTypes['Document']> };
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  PageInfo: PageInfo;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
}>;

export type CollectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DocumentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  collection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType>;
  collectionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DocumentConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DocumentConnection'] = ResolversParentTypes['DocumentConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType, RequireFields<MutationCreateCollectionArgs, 'name' | 'slug'>>;
  createDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationCreateDocumentArgs, 'collectionId' | 'content' | 'title'>>;
  deleteDocument?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteDocumentArgs, 'id'>>;
  moveDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationMoveDocumentArgs, 'collectionId' | 'id'>>;
  updateDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationUpdateDocumentArgs, 'id'>>;
}>;

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<QueryCollectionArgs, 'id'>>;
  collections?: Resolver<Array<ResolversTypes['Collection']>, ParentType, ContextType>;
  documents?: Resolver<ResolversTypes['DocumentConnection'], ParentType, ContextType, Partial<QueryDocumentsArgs>>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Collection?: CollectionResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  DocumentConnection?: DocumentConnectionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

