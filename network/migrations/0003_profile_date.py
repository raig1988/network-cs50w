# Generated by Django 4.1 on 2022-09-23 15:05

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_profile_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='date',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]
