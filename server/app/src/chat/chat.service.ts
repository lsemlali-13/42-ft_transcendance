import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient;

@Injectable()
export class ChatService {
  async createGroup(userId: string, groupName: string, password: string, status: any) {
    const salt = await bcrypt.genSalt()
    const hash = status == 'Protected' && password && password.length ? await bcrypt.hash(password, salt) : null
    const group = await prisma.chat.create({
      data: {
        name: groupName,
        image: join(__dirname,'group-icon-original.svg'),
        isGroup: true,
        status: status,
        password: hash
      }
    })
    await prisma.userChat.create({
      data: {
        userId: userId,
        chatId: group.id
      }
    })
  }
  async removeGroup(userId: string, groupId: number) {
    const group = await prisma.chat.delete({
      where: {
        id: groupId
      }
    })
  }

  async changePass(userId: string, groupId: number, password: string) {
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: groupId
      }
    })
    if (!userChat)
      throw new UnauthorizedException('user not in group')
    if (userChat.role != 'Owner' && userChat.role != 'Admin')
      throw new UnauthorizedException('user is neither Owner or Admin in this group')
    const group = await prisma.chat.findFirst({
      where: {
        id: groupId
      }
    })
    if (!group || group.status != 'Protected' || password || password.length < 5 )
      throw new InternalServerErrorException('something wrong')
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    await prisma.chat.update({
      where: {
        id: groupId
      },
      data: {
        password: hash
      }
    })
  }

  async removePass(userId: string, groupId: number, password: string) {
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: groupId
      }
    })
    if (!userChat)
      throw new UnauthorizedException('user not in group')
    if (userChat.role != 'Owner' && userChat.role != 'Admin')
      throw new UnauthorizedException('user is neither Owner or Admin in this group')
    const group = await prisma.chat.findFirst({
      where: {
        id: groupId
      }
    })
    if (!group || group.status != 'Protected' || password || password.length < 5 )
      throw new InternalServerErrorException('something wrong')
    await prisma.chat.update({
      where: {
        id: groupId
      },
      data: {
        status: 'Public',
        password: null
      }
    })
  }

  // async mute(userId: string, groupId: number, time: number) {
  //   const userChat = await prisma.userChat.findFirst({
  //     where: {
  //       userId: userId,
  //       chatId: groupId
  //     }
  //   })
  //   if (!userChat)
  //     throw new UnauthorizedException('user not in group')
  //   if (userChat.role != 'Owner' && userChat.role != 'Admin')
  //     throw new UnauthorizedException('user is neither Owner or Admin in this group')
  //   const group = await prisma.chat.findFirst({
  //     where: {
  //       id: groupId
  //     }
  //   })
  //   if (!group || group.status != 'Protected' || password || password.length < 5 )
  //     throw new InternalServerErrorException('something wrong')
  //   await prisma.chat.update({
  //     where: {
  //       id: groupId
  //     },
  //     data: {
  //       status: 'Public',
  //       password: null
  //     }
  //   })
  // }  

  async addToGroup(userId: string, targetId: string, groupId: number) {
    const group = await prisma.chat.findFirst({
      where: {
        id: groupId
      }
    })
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: groupId
      }
    })
    if (!userChat)
      throw new UnauthorizedException('user not in group')
    if (userChat.role != 'Owner' && userChat.role != 'Admin')
      throw new UnauthorizedException('user is neither Owner or Admin in this group')
    await prisma.userChat.create({
      data: {
        userId: targetId,
        chatId: group.id
      }
    })
  }

  async joinGroup(userId: string, groupId: number, password: string) {
    const group = await prisma.chat.findFirst({
      where: {
        id: groupId
      }
    })
    if (group.status == 'Private')
      throw new UnauthorizedException('group is private')
    if (group.status == 'Protected') {
      const unhashed = bcrypt.compare(password, group.password, () => {
        throw new UnauthorizedException('wrong password to joing group')
      })
    }
    await prisma.userChat.create({
      data: {
        userId: userId,
        chatId: group.id
      }
    })
  }

  async createMessage(userId: string, chatId: number, content: string) {
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        chatId: chatId,
        body: content,
      }
    })
  }

  async getMessages(userId: string, chatId: number) {
    const messages = await prisma.message.findMany({
      where: {
        senderId: userId,
        chatId: chatId
      },
      select: {
        sender: {
          select: {
            profile: {
              select: {
                userId: true,
                username: true
              }
            }
          }
        },
        body: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    const neededForm = messages.map(message => ({
      isMe: message.sender.profile.userId == userId ? true : false,
      username: message.sender.profile.username,
      content: message.body
    }))
    return neededForm
  }

  async getUserRoleInChat(userId: string, chatId: number) {
    const chat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: chatId
      },
      select: {
        role: true
      }
    })
    return chat.role
  } 

  async getChat(userId: string) {
    const chat = await prisma.userChat.findMany({
      where: {
        userId: userId,
      },
      select: {
        user: {
          select: {
            profile: {
              select: {
                state: true
              }
            }
          }
        },
        chat: {
          select: {
            id: true,
            name: true,
            image: true,
            isGroup: true,
            lastMessage: true
          }
        },
        dmName: true,
        dmImage: true,
        role: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    const neededForm = chat.map(ch => ({
      id: ch.chat.id,
      name: ch.chat.isGroup ? ch.chat.name : ch.dmName,
      image: ch.chat.isGroup ? ch.chat.image : ch.dmImage,
      status: ch.user.profile.state,
      isAdmin: ch.role == 'Owner' || ch.role == 'Admin',
      isGroup: ch.chat.isGroup,
      lastMessage: ch.chat.lastMessage
    }))
    return neededForm
  }

  async searchGroups(keyword: string) {
    const matches = await prisma.chat.findMany({
        where: {
            name: {
                startsWith: keyword,
            },
            isGroup: true,
            OR: [
              {
                status: 'Public'
              },
              {
                status: 'Protected'
              }
            ]
        },
        select: {
            name: true
        }
    })
    return matches
  }
}