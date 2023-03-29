import { GraphQLObjectType, GraphQLString, GraphQLEnumType, GraphQLList, GraphQLID, GraphQLSchema, GraphQLNonNull } from 'graphql'
import ClientModel from './Client.js';
import ProjectModel from './Project.js';


const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
    })
})

const ProjectType = new GraphQLObjectType({
    name: "Project",
    fields: () => ({
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args){
                return ClientModel.findById(parent.id)
            }
        }
    })
})

const queryRoot = new GraphQLObjectType({
    name: 'QueryRoot',
    fields: {
        client: {
            type: ClientType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args){
                return ClientModel.findById(args.id)
            }
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args){
                return ClientModel.find();
            }
        },
        project: {
            type: ProjectType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args){
                return ProjectModel.findById(args.id);
            }
        },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args){
                return ProjectModel.find();
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args){
               const client = new ClientModel({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })
                return client.save();

            }
        },
        // delete a client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                return ClientModel.findByIdAndRemove(args.id)
            }
        },
        // update a client
        updateClient: {
            type: ClientType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                phone: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve(parent, args){
                return client = ClientModel.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            email: args.email,
                            phone: args.phone,
                        },
                    },
                    { new: true }
                )
            }
        },
        // add a project
        addProject : {
            type: ProjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': {  value: 'Not Started' },
                            'started': { value: 'In Progress'},
                            'completed': { value: 'Work Completed'},
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: { type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const project = new ProjectModel({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                })
                return project.save();
            }
        },
        // delete a project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                return ProjectModel.findByIdAndRemove(args.id)
            }
        },
        // update a project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID)},
                name: { type: GraphQLString},
                description: { type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'UpdateProject',
                        values: {
                            'new': {  value: 'Not Started' },
                            'started': { value: 'In Progress'},
                            'completed': { value: 'Work Completed'},
                        },
                    }),
                },
                
            },
            resolve(parent, args){
                return ProjectModel.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status,
                        }
                    },
                    { new: true }
                )
            }
        }
    }
})

const schemas = new GraphQLSchema({
    query: queryRoot,
    mutation
})

export default schemas