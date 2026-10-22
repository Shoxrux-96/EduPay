import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AcademyConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time academy notifications:
    - PAYMENT_ADDED
    - STUDENT_CREATED
    - STUDENT_UPDATED
    - STUDENT_DELETED
    """
    async def connect(self):
        self.room_group_name = 'academy_live_updates'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send connected acknowledgement
        await self.send(text_data=json.dumps({
            'type': 'CONNECTED',
            'message': 'Django Channels WebSocket ulandi (Real-time monitoring faol)'
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'PING':
                await self.send(text_data=json.dumps({'type': 'PONG'}))
        except Exception:
            pass

    # Broadcast event handler
    async def academy_event(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['payload']
        }))
