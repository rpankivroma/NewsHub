"""Fix donation table

Revision ID: 34c8e27beb48
Revises: 20836fab49f4
Create Date: 2026-05-03 16:48:49.612862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '34c8e27beb48'
down_revision: Union[str, None] = '20836fab49f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
